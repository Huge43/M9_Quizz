import { Form, Link, data, redirect, useActionData, useLoaderData } from 'react-router';
import { API_URL } from '../api-url.js';

/**
 * La liste de l'animateur : ses questionnaires. (Tous, en fait — les
 * comptes arrivent à la semaine 5.)
 *
 * TODO (partie 2, jalon ①) : passer du rendu côté client au rendu côté
 * serveur. Pour l'instant, la page part vide et va chercher ses données
 * dans le navigateur, après le rendu — affichez la source de la page : les
 * questionnaires n'y sont pas. Reprenez le loader écrit ensemble au
 * tableau :
 *
 * 1. Exportez une fonction `loader` : elle s'exécute sur le serveur, AVANT
 *    le rendu. Elle appelle l'API par son adresse complète —
 *    fetch('http://localhost:3000/api/quizzes') — et retourne le JSON.
 * 2. Dans le composant, remplacez useState + useEffect par
 *    const quizzes = useLoaderData();
 * 3. Réaffichez la source de la page : les titres y sont, déjà en HTML.
 * 
 *
 */

export async function loader() {
  const response = await fetch('http://localhost:3000/api/quizzes');
  if (!response.ok) {
    throw new Error(`Erreur lors du chargement des questionnaires : ${response.status}`);
  }
  return response.json();
}

export default function Quizzes() {
  const quizzes = useLoaderData();

  return (
    <main className="screen">
      <h1>Mes questionnaires</h1>
      <ul className="quiz-list">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="card row">
            <div>
              <h2>
                <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
              </h2>
              <p className="progress">{quiz.questionCount} questions</p>
            </div>
            <Link className="button" to={`/quizzes/${quiz.id}/edit`}>Modifier</Link>
          </li>
        ))}
      </ul>

      {/* Un formulaire HTML classique : method et action, comme au livre
          d'or. <Form> de React Router l'envoie à l'action de cette route
          sans recharger la page — et rejoue le loader ensuite. */}
      <Form method="post" className="card">
        <h2>Nouveau questionnaire</h2>
        <label>
          Titre
          <input name="title" placeholder="Titre du questionnaire" required />
        </label>
        {actionData?.error && <p className="error">{actionData.error}</p>}
        <button>Créer</button>
      </Form>
    </main>
  );
}
