import gsap from "gsap";

export const scrollAnimation = (position, target, isMobile, onUpdate) => {
  const timeline = gsap.timeline();

  timeline
    .to(position, {
      //x, y, z are the initial values that will be changed on scroll Trigger
      x: !isMobile ? -3.38 : -7.0,
      y: !isMobile ? -10.74 : -12.2,
      z: !isMobile ? -5.93 : -6.0,
      scrollTrigger: {
        trigger: ".sound-section",
        start: "top bottom", //start animation when top of sound-section hits bottom of the view port (i.e., when we start seeing sound section in the view)
        end: "top top", //end animation when top of the sound-section reaches the top of the view port (i.e., when all sound section is seen)
        scrub: 2, //with scrub true (can also be placed), animation/transition will trigger (here, 2 is the delay time)
        immediateRender: false, //this is for improving the performance of the website. This will say not to render transition until it is triggered
      },
      // on animation is done, call the onUpdate animation.
      // This method sets needsUpdate flag to true and viewer as dirty (which implies viewer needs to be updated)
      // So, it triggers the preFrame event listener
      onUpdate,
    })
    .to(target, {
      //these are the values at the end of the animation
      x: !isMobile ? 1.52 : 0.7,
      y: !isMobile ? 0.77 : 1.9,
      z: !isMobile ? -1.08 : 0.7,
      scrollTrigger: {
        trigger: ".sound-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    })
    .to(".jumbotron-section", {
      //as we go down the sound section, the opacity of jumbotron section will decrease to give this nice effect of like fading out
      opacity: 0,
      scrollTrigger: {
        trigger: ".sound-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    })
    .to(".sound-section-content", {
      //as we go down the sound section, the opacity of sound section will increase to give this nice effect of like fading in
      opacity: 1,
      scrollTrigger: {
        trigger: ".sound-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    })
    //now to add new animation from sound section to display section
    .to(position, {
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
      onUpdate,
    })
    .to(target, {
      x: !isMobile ? -0.55 : -1.62,
      y: !isMobile ? 0.32 : 0.02,
      z: !isMobile ? 0.0 : -0.06,
      scrollTrigger: {
        trigger: ".display-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    })
    .to(".display-section", {
      opacity: 1,
      scrollTrigger: {
        trigger: ".display-section",
        start: "top bottom",
        end: "top top",
        scrub: 2,
      },
    });
};
