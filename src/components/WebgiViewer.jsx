import {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  addBasePlugins,
  CanvasSnipperPlugin,
  mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollAnimation } from "../lib/scroll-animation";

gsap.registerPlugin(ScrollTrigger);

//we are using forwardRef so that we can call a function from this component in our parent App.jsx through the use of ref.
const WebgiViewer = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  //this ref is to enable the rotation or free look view of the iphone when in preview mode
  const canvasContainerRef = useRef(null);

  const [viewerRef, setViewerRef] = useState(null);
  const [targetRef, setTargetRef] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [positionRef, setPositionRef] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false); //to check for responsiveness in mobile devices

  useEffect(() => {
    setupViewer();
  }, []);

  //because of this useImperativeHandle, we can call the triggerPreview in the parent i.e. App.jsx
  useImperativeHandle(ref, () => ({
    triggerPreview() {
      setPreviewMode(true);

      canvasContainerRef.current.style.pointerEvents = "all"; //this will add that pointer event in canvas to rotate iphone for preview mode
      props.contentRef.current.style.opacity = "0"; // when in preview mode hide all other sections

      gsap.to(positionRef, {
        x: 13.04,
        y: -2.01,
        z: 2.29,
        duration: 2,
        onUpdate: () => {
          viewerRef.setDirty();
          cameraRef.positionTargetUpdated(true);
        },
      });

      gsap.to(targetRef, {
        x: 0.11,
        y: 0.0,
        z: 0.0,
        duration: 2,
      });

      //for rotation of iphone in preview mode, we need to make the cameraview control be enabled
      viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
    },
  }));

  const memoizedScrollAnimation = useCallback(
    (position, target, isMobile, onUpdate) => {
      if (position && target && onUpdate) {
        //animation (position) would be different for mobile or website
        scrollAnimation(position, target, isMobile, onUpdate);
      }
    },
    []
  );

  const setupViewer = useCallback(async () => {
    const viewer = new ViewerApp({
      canvas: canvasRef.current,
    });

    setViewerRef(viewer);

    //check if viewer is in mobile
    const isMobileOrTablet = mobileAndTabletCheck();
    setIsMobile(isMobileOrTablet);

    const manager = await viewer.addPlugin(AssetManagerPlugin);

    const camera = viewer.scene.activeCamera;
    const position = camera.position;
    const target = camera.target;

    setCameraRef(camera);
    setPositionRef(position);
    setTargetRef(target);

    await viewer.addPlugin(GBufferPlugin);
    await viewer.addPlugin(new ProgressivePlugin(32));
    await viewer.addPlugin(new TonemapPlugin(true));
    await viewer.addPlugin(GammaCorrectionPlugin);
    await viewer.addPlugin(SSRPlugin);
    await viewer.addPlugin(SSAOPlugin);
    await viewer.addPlugin(BloomPlugin);

    //This must be called once after all plugins are added.
    viewer.renderer.refreshPipeline();

    await manager.addFromPath("/scene-black.glb");

    viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

    if (isMobileOrTablet) {
      //reset the position to fit the mobile phone
      position.set(-16.7, 1.17, 11.7);
      target.set(0, 1.37, 0);
      props.contentRef.current.className = "mobile-or-tablet"; //changing the className of our main content in App.tsx
    }

    window.scrollTo(0, 0);

    let needsUpdate = true;

    const onUpdate = () => {
      needsUpdate = true;
      viewer.setDirty();
    };

    viewer.addEventListener("preFrame", () => {
      if (needsUpdate) {
        camera.positionTargetUpdated(true);
        needsUpdate = false;
      }
    });

    memoizedScrollAnimation(position, target, isMobileOrTablet, onUpdate);
  });

  const handleExit = useCallback(() => {
    //just doing opposite of what we did for enabling the rotation of iphone in preview mode
    canvasContainerRef.current.style.pointerEvents = "none";
    props.contentRef.current.style.opacity = "1";
    viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
    setPreviewMode(false);

    //setting to its previous position (i.e. where it would be on display section)
    gsap.to(positionRef, {
      x: !isMobile ? 1.56 : 9.36,
      y: !isMobile ? 5.0 : 10.95,
      z: !isMobile ? 0.01 : 0.09,
      scrollTrigger: {
        trigger: ".display-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
        immediateRender: false,
      },
      onUpdate: () => {
        //this will let the ref to rerender
        viewerRef.setDirty();
        cameraRef.positionTargetUpdated(true);
      },
    });
    gsap.to(targetRef, {
      x: !isMobile ? -0.55 : -1.62,
      y: !isMobile ? 0.32 : 0.02,
      z: !isMobile ? 0.0 : -0.06,
      scrollTrigger: {
        trigger: ".display-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    });
  }, [canvasContainerRef, viewerRef, positionRef, cameraRef, targetRef]);

  return (
    <div id="webgi-canvas-container" ref={canvasContainerRef}>
      <canvas id="webgi-canvas" ref={canvasRef} />
      {previewMode && (
        <button className="button" onClick={handleExit}>
          Exit
        </button>
      )}
    </div>
  );
});

export default WebgiViewer;
