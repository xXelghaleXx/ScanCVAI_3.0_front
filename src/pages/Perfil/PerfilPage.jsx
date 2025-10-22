import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar,
  Edit2,
  Save,
  X,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import Background from '../../components/layout/Background/Background';
import authService from '../../services/auth.service';
import { API_BASE_URL } from '../../config/api.config.js';
import '../../styles/pages/Perfil.css';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [editedData, setEditedData] = useState({
    nombre: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setUser(data.profile);
      setEditedData({ nombre: data.profile.nombre });

    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedData({ nombre: user.nombre });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('access_token');

      if (!editedData.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: editedData.nombre.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }

      const data = await response.json();

      // Actualizar localStorage
      localStorage.setItem('nombre', editedData.nombre.trim());
      const currentUser = authService.getUser();
      if (currentUser) {
        currentUser.nombre = editedData.nombre.trim();
        localStorage.setItem('user', JSON.stringify(currentUser));
      }

      setUser({ ...user, nombre: editedData.nombre.trim() });
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);

      // Disparar evento para que el Header se actualice
      window.dispatchEvent(new Event('profileUpdated'));

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loader">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="perfil-container">
        <div className="error">No se pudo cargar el perfil</div>
      </div>
    );
  }

  return (
    <>
      <Background />
      <div className="perfil-container">
        <motion.div
          className="perfil-card"
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="perfil-header">
          <div className="perfil-avatar">
            <User size={48} />
          </div>
          <h2>Mi Perfil</h2>
        </div>

        {/* Mensajes */}
        {error && (
          <motion.div 
            className="alert alert-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Check size={20} />
            {success}
          </motion.div>
        )}

        {/* Contenido */}
        <div className="perfil-content">
          
          {/* Nombre */}
          <div className="perfil-field">
            <label>
              <User size={18} />
              Nombre completo
            </label>
            {editing ? (
              <input
                type="text"
                value={editedData.nombre}
                onChange={(e) => setEditedData({ nombre: e.target.value })}
                placeholder="Ingresa tu nombre"
                className="perfil-input"
              />
            ) : (
              <div className="perfil-value">{user.nombre}</div>
            )}
          </div>

          {/* Correo (no editable) */}
          <div className="perfil-field">
            <label>
              <Mail size={18} />
              Correo electrónico
            </label>
            <div className="perfil-value">{user.correo}</div>
          </div>

          {/* Fecha de registro */}
          <div className="perfil-field">
            <label>
              <Calendar size={18} />
              Fecha de registro
            </label>
            <div className="perfil-value">{formatDate(user.fecha_registro)}</div>
          </div>

          {/* Último acceso */}
          <div className="perfil-field">
            <label>
              <Clock size={18} />
              Último acceso
            </label>
            <div className="perfil-value">{formatDate(user.fecha_ultimo_acceso)}</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="perfil-actions">
          {editing ? (
            <>
              <button 
                onClick={handleSave} 
                className="btn btn-primary"
                disabled={saving}
              >
                <Save size={18} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button 
                onClick={handleCancel} 
                className="btn btn-secondary"
                disabled={saving}
              >
                <X size={18} />
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="btn btn-primary">
              <Edit2 size={18} />
              Editar perfil
            </button>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default Perfil;