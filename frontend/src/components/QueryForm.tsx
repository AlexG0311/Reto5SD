import { useState } from 'react';

interface QueryFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  '¿Cuáles son los 5 artistas con más ventas?',
  '¿Qué géneros musicales tienen más canciones?',
  '¿Cuáles son los 10 clientes que más han gastado?',
  '¿Qué álbumes tiene el artista Iron Maiden?',
];

export default function QueryForm({ onSubmit, isLoading }: QueryFormProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  const submitQuestion = () => {
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <textarea
        className="query-input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Escribe tu pregunta en lenguaje natural..."
        rows={3}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitQuestion();
          }
        }}
      />
      <div className="form-footer">
        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="example-chip"
              onClick={() => setQuestion(ex)}
              disabled={isLoading}
            >
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" className="submit-btn" disabled={isLoading || !question.trim()}>
          {isLoading ? <span className="spinner" /> : 'Consultar'}
        </button>
      </div>
    </form>
  );
}
