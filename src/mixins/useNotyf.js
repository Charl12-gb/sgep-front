import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

export function useNotyf() {
    const notyfInstance = new Notyf({
        duration: 5000,
        position: {
            x: 'right',
            y: 'top',
        },
        types: [
            {
                type: 'default',
                backgroundColor: '#3B7DDD',
                icon: {
                    className: 'notyf__icon--success',
                    tagName: 'i',
                },
            },
            {
                type: 'success',
                backgroundColor: '#28a745',
                icon: {
                    className: 'notyf__icon--success',
                    tagName: 'i',
                },
            },
            {
                type: 'warning',
                backgroundColor: '#ffc107',
                icon: {
                    className: 'notyf__icon--error',
                    tagName: 'i',
                },
            },
            {
                type: 'danger',
                backgroundColor: '#dc3545',
                icon: {
                    className: 'notyf__icon--error',
                    tagName: 'i',
                },
            },
        ],
    });

    function notifyError(error) {
        if (!error) return;
    
        // Gérer les erreurs avec les clés 'message' ou 'detail'
        if ((error.message && error.message !== 'undefined') || (error.detail && error.detail !== 'undefined')) {
            const message = error.message || error.detail;
            notyfInstance.open({
                type: 'danger',
                message: message,
                dismissible: true
            });
        } else if (typeof error === 'object' && !Array.isArray(error)) {
            const errors = { ...error };
            const notifications = [];
    
            // Gérer chaque clé dans l'objet d'erreur
            for (const key in errors) {
                if (Object.prototype.hasOwnProperty.call(errors, key)) {
                    const message = errors[key].message || errors[key].detail || errors[key];
                    notifications.push({
                        type: 'danger',
                        message: `${key.toUpperCase()} : ${message}`,
                        dismissible: true,
                    });
                }
            }
    
            // Afficher les notifications pour chaque erreur
            for (const notification of notifications) {
                notyfInstance.open(notification);
            }
        } else if (Array.isArray(error)) {
            // Gérer les erreurs sous forme de tableau
            for (const errorMsg of error) {
                const message = errorMsg.message || errorMsg.detail || errorMsg;
                notyfInstance.open({
                    type: 'danger',
                    message: message,
                    dismissible: true
                });
            }
        } else {
            // Gérer les erreurs de type chaîne ou autre type
            notyfInstance.open({
                type: 'danger',
                message: String(error),
                dismissible: true
            });
        }
    }    

    function notifySuccess(message, type='success') {
        notyfInstance.open({
            type: type,
            message: message,
            dismissible: true
        });
    }

    function notifyConfirm(message, subtitle = '') {
        return new Promise((resolve) => {
            // Créer une div pour la modale de confirmation
            const modal = document.createElement('div');
            modal.className = 'custom-confirm-modal';
            modal.innerHTML = `
                <div class="confirm-overlay">
                    <div class="confirm-dialog">
                        <div class="confirm-header">
                            <h3>Confirmation</h3>
                        </div>
                        <div class="confirm-body">
                            <p class="confirm-message">${message}</p>
                            ${subtitle ? `<p class="confirm-subtitle">${subtitle}</p>` : ''}
                        </div>
                        <div class="confirm-actions">
                            <button class="btn btn-cancel">Annuler</button>
                            <button class="btn btn-confirm">Confirmer</button>
                        </div>
                    </div>
                </div>
            `;

            // Ajouter les styles CSS inline
            const style = document.createElement('style');
            style.textContent = `
                .custom-confirm-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                }
                .confirm-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .confirm-dialog {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    max-width: 400px;
                    width: 90%;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .confirm-header {
                    padding: 1.5rem 1.5rem 0;
                }
                .confirm-header h3 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 1.2rem;
                }
                .confirm-body {
                    padding: 1rem 1.5rem;
                }
                .confirm-message {
                    margin: 0 0 0.5rem 0;
                    color: #2c3e50;
                    line-height: 1.5;
                }
                .confirm-subtitle {
                    margin: 0;
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    font-style: italic;
                }
                .confirm-actions {
                    padding: 0 1.5rem 1.5rem;
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }
                .confirm-actions .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .btn-cancel {
                    background: #95a5a6;
                    color: white;
                }
                .btn-cancel:hover {
                    background: #7f8c8d;
                }
                .btn-confirm {
                    background: #e74c3c;
                    color: white;
                }
                .btn-confirm:hover {
                    background: #c0392b;
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(modal);

            // Gérer les clics
            const handleCancel = () => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                resolve(false);
            };

            const handleConfirm = () => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                resolve(true);
            };

            // Ajouter les événements
            modal.querySelector('.btn-cancel').addEventListener('click', handleCancel);
            modal.querySelector('.btn-confirm').addEventListener('click', handleConfirm);
            modal.querySelector('.confirm-overlay').addEventListener('click', (e) => {
                if (e.target === modal.querySelector('.confirm-overlay')) {
                    handleCancel();
                }
            });

            // Gérer la touche Escape
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleKeyDown);
                    handleCancel();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        });
    }

    return { notifyError, notifySuccess, notifyConfirm };
}
