interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DialogBox: React.FC<DialogBoxProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
