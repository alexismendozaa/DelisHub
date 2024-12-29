import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [message, setMessage] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [canModify, setCanModify] = useState(false);

  // Verificar si el usuario puede modificar un comentario
  const checkCommentPermissions = async (commentId) => {
    try {
      const response = await apiClient.get(`/comments/${commentId}/can-modify`);
      return response.data.canModify;
    } catch (error) {
      console.error('Error checking comment permissions:', error);
      return false;
    }
  };

  // Traer los detalles de la receta y los comentarios
  useEffect(() => {
    const fetchRecipeAndComments = async () => {
      try {
        // Obtener los detalles de la receta
        const recipeResponse = await apiClient.get(`/recipes/${id}`);
        setRecipe(recipeResponse.data);

        // Verificar si el usuario puede modificar la receta
        const canModifyResponse = await apiClient.get(`/recipes/${id}/can-modify`);
        setCanModify(canModifyResponse.data.canModify);

        // Obtener los comentarios con los datos del creador
        const commentsResponse = await apiClient.get(`/comments/${id}`);
        const commentsWithPermissions = await Promise.all(
          commentsResponse.data.comments.map(async (comment) => {
            const canModify = await checkCommentPermissions(comment.id);
            return { ...comment, canModify };
          })
        );

        setComments(commentsWithPermissions);
      } catch (error) {
        console.error('Error fetching recipe details or permissions:', error);
        setMessage('Error al cargar los detalles de la receta y comentarios.');
        setComments([]);
      }
    };

    fetchRecipeAndComments();
  }, [id]);

  // Agregar un nuevo comentario
  const handleAddComment = async () => {
    if (!newComment) {
      setMessage('El comentario no puede estar vacío.');
      return;
    }

    try {
      const response = await apiClient.post('/comments', {
        recipeId: id,
        content: newComment,
      });

      const newCommentData = response.data.comment;
      const canModify = await checkCommentPermissions(newCommentData.id);
      setComments([{ ...newCommentData, canModify }, ...comments]);
      setNewComment('');
      setMessage('Comentario agregado exitosamente.');
    } catch (error) {
      console.error('Error al agregar el comentario:', error);
      setMessage('Error al agregar el comentario.');
    }
  };

  // Iniciar la edición de un comentario
  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  // Guardar los cambios en un comentario
  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/comments/${editingComment}`, { content: editContent });
      setComments(
        comments.map((comment) =>
          comment.id === editingComment ? { ...comment, content: editContent } : comment
        )
      );
      setEditingComment(null);
      setMessage('Comentario editado exitosamente.');
    } catch (error) {
      console.error('Error al editar el comentario:', error);
      setMessage('Error al editar el comentario.');
    }
  };

  // Eliminar un comentario
  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      setComments(comments.filter((comment) => comment.id !== commentId));
      setMessage('Comentario eliminado exitosamente.');
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
      setMessage('Error al eliminar el comentario.');
    }
  };

  if (!recipe) return <p className="text-center">Cargando receta...</p>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg p-4">
            <h1 className="mb-3 text-center text-primary">{recipe.title}</h1>
            <p className="lead text-center text-muted">{recipe.description}</p>

            {recipe.user ? (
              <p className="text-center text-muted">
                <strong>Publicado por:</strong> {recipe.user.username} ({recipe.user.email})
              </p>
            ) : (
              <p className="text-center text-muted">Usuario no disponible</p>
            )}

            <div className="d-flex justify-content-center mt-4">
              <button
                className="btn btn-outline-primary me-2"
                onClick={() => navigate('/dashboard')}
              >
                <i className="bi bi-house-door"></i> Dashboard
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/recipes')}
              >
                Ver Todas las Recetas
              </button>
            </div>

            <section className="mt-5">
              <h3 className="h4 text-muted mb-3">Ingredientes</h3>
              <ul className="list-group list-group-flush">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="list-group-item border-0 py-2 px-4 mb-2 rounded-sm"
                    style={{ backgroundColor: '#f7f7f7', fontWeight: 300 }}
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-5">
              <h3 className="h4 text-muted mb-3">Pasos</h3>
              <ol className="list-group list-group-numbered">
                {recipe.steps.map((step, index) => (
                  <li
                    key={index}
                    className="list-group-item border-0 py-2 px-4 mb-2 rounded-sm"
                    style={{ backgroundColor: '#f7f7f7', fontWeight: 300 }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-5">
              <h3 className="h4 text-muted mb-3">Comentarios</h3>
              <ul className="list-group mb-4">
              {comments.map((comment) => (
  <li
    key={comment.id}
    className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 mb-2 rounded-sm"
    style={{ backgroundColor: '#f7f7f7' }}
  >
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">
          <strong>
            {comment.User?.username || 'Usuario desconocido'}
            {comment.User?.email ? ` (${comment.User.email})` : ''}
          </strong>{' '}
          -{' '}
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      </div>
      <p className="mb-1">{comment.content}</p>
    </div>
    {comment.canModify && (
      <div className="d-flex">
        <button
          className="btn btn-sm btn-warning me-2"
          onClick={() => handleEditComment(comment)}
        >
          Editar
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDeleteComment(comment.id)}
        >
          Eliminar
        </button>
      </div>
    )}
  </li>
))}

</ul>

              <div className="input-group mb-4">
                <textarea
                  className="form-control"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleAddComment}>
                  Agregar Comentario
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
