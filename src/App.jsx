import { useRef } from "react";
import DisplaySection from "./components/DisplaySection";
import Jumbotron from "./components/Jumbotron";
import Nav from "./components/Nav";
import SoundSection from "./components/SoundSection";
import WebgiViewer from "./components/WebgiViewer";
import Loader from "./components/Loader";

function App() {
  const webgiViewerRef = useRef();
  const contentRef = useRef();

  //this function will be called when a button inside DisplaySection will be clicked (so passing as props)
  const handlePreview = () => {
    //here we are calling a function that is defined inside the children i.e. WebgiViewer.jsx
    webgiViewerRef.current.triggerPreview();
  };

  return (
    <div className="App">
      <Loader />
      <div ref={contentRef} id="content">
        <Nav />
        <Jumbotron />
        <SoundSection />
        <DisplaySection triggerPreview={handlePreview} />
      </div>
      {/* here content ref is created and is other components are separated since when we click try me, all the other components would hide */}
      <WebgiViewer contentRef={contentRef} ref={webgiViewerRef} />
    </div>
  );
}

export default App;
