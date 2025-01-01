import { createPortal } from "react-dom";

export interface ModalType {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  header: string;
  message: string;
  optionConfirm: string;
  optionClose: string;
}

const Modal = (modal: ModalType) => {
  if (!modal.isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{modal.header}</h2>
        <p>{modal.message}</p>
        <div className="modal-options">
          <button onClick={modal.onConfirm}>{modal.optionConfirm}</button>
          {modal.optionClose && (
            <button onClick={modal.onClose}>{modal.optionClose}</button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("modal") as HTMLElement
  );
};
export default Modal;
