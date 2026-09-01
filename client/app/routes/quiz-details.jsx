import { Link, useLoaderData } from 'react-router';
import { API_URL } from '../api-url.js';

/**
 * Un questionnaire et ses questions — ce que l'animateur vérifie avant de
 * jouer. La bonne réponse est cochée : c'est la vue de l'AUTEUR.
 *
 * Rendu CÔTÉ SERVEUR, calqué sur le loader de la liste ; params.id vient
 * de l'URL (/quizzes/:id).
 */
export async function loader({ params }) {
  const response = await fetch(`http://localhost:3000/api/quizzes/${params.id}`);
  if (!response.ok) {
    throw new Error(`Erreur lors du chargement du questionnaire : ${response.status}`);
  }
  return response.json();
}

export default function QuizDetails() {
  const quiz = useLoaderData();

  useEffect(() => {
    fetchQuiz(id).then(setQuiz).catch(() => {});
  }, [id]);

  if (!quiz) return <main className="screen">Chargement…</main>;

  return (
    <main className="screen">
      <h1>{quiz.title}</h1>
      <p>
        <Link to="/quizzes">← Mes questionnaires</Link>
        {' · '}
        <Link to={`/quizzes/${quiz.id}/edit`}>Modifier</Link>
      </p>
      {quiz.questions.map((question, i) => (
        <section key={question.id} className="card question">
          <h2>
            {i + 1}. {question.text}
          </h2>
          <p className="progress">{question.durationSeconds} secondes</p>
          <ul className="choice-list">
            {question.choices.map((choice) => (
              <li key={choice.id} className={choice.isCorrect ? 'correct' : ''}>
                {choice.text} {choice.isCorrect && '✓'}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
