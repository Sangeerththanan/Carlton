import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  closeButtonClassName?: string;
  headerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
  overlayClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  useFrame?: boolean;
  frameClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerClassName,
  titleClassName,
  subtitleClassName,
  closeButtonClassName,
  headerStyle,
  titleStyle,
  subtitleStyle,
  overlayClassName,
  panelClassName,
  bodyClassName,
  useFrame,
  frameClassName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${overlayClassName ?? 'bg-black/20 backdrop-blur-sm'}`}
    >
      <div className="w-full px-4">
        <div
          className={
            useFrame
              ? `rounded-2xl p-2 ${frameClassName ?? 'bg-white/20 backdrop-blur-md'}`
              : ''
          }
        >
          <div
            className={`bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto${panelClassName ? ` ${panelClassName}` : ''}`}
          >
          <div
            className={`flex justify-between items-center gap-4 p-6 border-b border-gray-200${headerClassName ? ` ${headerClassName}` : ''}`}
            style={headerStyle}
          >
            <div className="min-w-0">
              <h2
                className={`text-xl font-bold text-gray-800${titleClassName ? ` ${titleClassName}` : ''}`}
                style={titleStyle}
              >
                {title}
              </h2>
              {!!subtitle && (
                <div
                  className={`text-sm text-gray-500 mt-0.5${subtitleClassName ? ` ${subtitleClassName}` : ''}`}
                  style={subtitleStyle}
                >
                  {subtitle}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
          </div>

          <div className={`p-6${bodyClassName ? ` ${bodyClassName}` : ''}`}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
