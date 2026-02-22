import { MdClose } from "react-icons/md";
import { useEffect, useRef } from "react";
import { useTranslation } from "../../contexts/TranslationProvider";
import "./Modal.scss";

const Modal = ({
  children,
  show,
  setShow,
  heading,
  dialogWidth = "25%",
  fullScreen = false,
  contentClassName = "",
  closeButton = true,
}) => {
  const modalRef = useRef(null);
  const t = useTranslation();

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [show]);

  const dialogStyle = fullScreen
    ? { width: "100vw", height: "100vh", maxWidth: "100vw", maxHeight: "100vh", margin: 0 }
    : { width: dialogWidth };

  return (
    <dialog
      ref={modalRef}
      className={`fm-modal dialog ${fullScreen ? "fm-modal-fullscreen" : ""}`}
      style={dialogStyle}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby="fm-modal-heading-id"
    >
      <div className="fm-modal-header">
        <span className="fm-modal-heading" id="fm-modal-heading-id">{heading}</span>
        {closeButton && (
          <MdClose
            size={18}
            onClick={() => setShow(false)}
            className="close-icon"
            title={t("close")}
          />
        )}
      </div>
      {fullScreen ? (
        <div className="fm-modal-content fm-modal-content-fullscreen">{children}</div>
      ) : (
        children
      )}
    </dialog>
  );
};

export default Modal;
