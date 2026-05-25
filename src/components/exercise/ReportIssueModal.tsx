import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { FlagIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface Props {
  visible: boolean;
  exerciseId: string;
  onClose: () => void;
  onReported: () => void;
}

export default function ReportIssueModal({ visible, exerciseId, onClose, onReported }: Props) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!comment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/exercises/${exerciseId}/reportedIssue`, { comment: comment.trim() });
      setComment('');
      onReported();
    } catch (e: any) {
      setError('Erro ao enviar o relato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setComment('');
    setError(null);
    onClose();
  }

  return (
    <Transition show={visible} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full sm:translate-y-4 sm:opacity-0"
              enterTo="translate-y-0 sm:translate-y-0 sm:opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 sm:translate-y-0 sm:opacity-100"
              leaveTo="translate-y-full sm:translate-y-4 sm:opacity-0"
            >
              <DialogPanel className="relative transform overflow-hidden bg-surface rounded-t-2xl sm:rounded-2xl text-left shadow-xl transition-all w-full sm:max-w-lg border-t sm:border border-primary-darker p-6 flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-2.5">
                    <FlagIcon className="w-6 h-6 text-primary" />
                    <DialogTitle as="h3" className="text-lg font-extrabold text-text-primary">
                      Reportar problema
                    </DialogTitle>
                  </div>
                  <button onClick={handleClose} className="text-primary-darker hover:text-primary transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-sm text-primary-dark leading-relaxed">
                  Descreva o problema encontrado neste exercício. Após o envio, o exercício será pulado.
                </p>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: As opções de correspondência estão erradas..."
                  rows={4}
                  className={`w-full bg-[#2A2A2A] border-[1.5px] rounded-xl p-3.5 text-sm text-text-primary outline-none transition-colors resize-none ${
                    comment.trim() ? 'border-primary' : 'border-[#3A3A3A] focus:border-primary-darker'
                  }`}
                />

                {error && <p className="text-sm text-danger">{error}</p>}

                <div className="flex flex-row gap-3 mt-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3.5 rounded-xl border-[1.5px] border-[#3A3A3A] text-text-primary font-bold hover:bg-[#3A3A3A]/30 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || loading}
                    className={`flex-[2] py-3.5 rounded-xl flex flex-row items-center justify-center gap-2 font-extrabold transition-colors ${
                      comment.trim() && !loading
                        ? 'bg-primary text-black hover:bg-primary-dark'
                        : 'bg-[#2A2A2A] text-[#4A4A4A] cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Enviar relato
                      </>
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
