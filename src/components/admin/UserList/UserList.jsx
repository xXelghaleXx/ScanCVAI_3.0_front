import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MessageCircle, BarChart3, Star, Trash2 } from "lucide-react";
import adminService from '../../../services/admin.service';
import Background from "../../layout/Background/Background";
import { toast } from "react-toastify";
import "../../../styles/components/admin/UserList.css";

function UserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    rol: "",
    estado: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  useEffect(() => {
    loadUsers();
  }, [filters.page, filters.rol, filters.estado]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filters);
      setUsers(response.data.usuarios);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("Error cargando lista de usuarios");

      if (error.response?.status === 403) {
        toast.error("No tienes permisos de administrador");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success("Rol actualizado correctamente");
      loadUsers();
    } catch (error) {
      console.error("Error actualizando rol:", error);
      toast.error(error.response?.data?.message || "Error actualizando rol");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success("Estado actualizado correctamente");
      loadUsers();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast.error(error.response?.data?.message || "Error actualizando estado");
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: "",
    });
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(deleteModal.userId);
      toast.success(`Usuario ${deleteModal.userName} eliminado correctamente`);
      closeDeleteModal();
      loadUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error(error.response?.data?.message || "Error eliminando usuario");
    }
  };

  if (loading && users.length === 0) {
    return (
      <>
        <Background />
        <div className="user-list-loading">
          <div className="user-list-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Background />
      <div className="user-list-wrapper">
        <div className="user-list-container">
        {/* Header */}
        <div className="user-list-header">
          <div className="user-list-header-content">
            <h1>Gestión de Usuarios</h1>
            <p>Administra usuarios y sus permisos</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="user-list-back-btn"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Filtros */}
        <div className="user-list-filters-card">
          <form onSubmit={handleSearch} className="user-list-filters-grid">
            <div className="user-list-filter-group">
              <label className="user-list-filter-label">Buscar</label>
              <input
                type="text"
                placeholder="Nombre o correo..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="user-list-filter-input"
              />
            </div>

            <div className="user-list-filter-group">
              <label className="user-list-filter-label">Rol</label>
              <select
                value={filters.rol}
                onChange={(e) => setFilters({ ...filters, rol: e.target.value, page: 1 })}
                className="user-list-filter-select"
              >
                <option value="">Todos</option>
                <option value="alumno">Alumno</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="user-list-filter-group">
              <label className="user-list-filter-label">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value, page: 1 })}
                className="user-list-filter-select"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div className="user-list-filter-group">
              <button
                type="submit"
                className="user-list-search-btn"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de usuarios */}
        <div className="user-list-table-card">
          <div className="user-list-table-wrapper">
            <table className="user-list-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="center">Métricas</th>
                  <th>Último Acceso</th>
                  <th className="center" style={{ minWidth: "180px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-info-details">
                          <div className="user-name">{user.nombre}</div>
                          <div className="user-email">{user.correo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.rol}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`user-role-select ${user.rol}`}
                      >
                        <option value="alumno">Alumno</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={user.estado}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`user-status-select ${user.estado}`}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </td>
                    <td className="center">
                      <div className="user-metrics-cell">
                        <div className="user-metrics-row">
                          <span className="user-metric-item" title="CVs">
                            <FileText size={14} /> {user.metricas.total_cvs}
                          </span>
                          <span className="user-metric-item" title="Entrevistas">
                            <MessageCircle size={14} /> {user.metricas.total_entrevistas}
                          </span>
                          <span className="user-metric-item" title="Informes">
                            <BarChart3 size={14} /> {user.metricas.total_informes}
                          </span>
                        </div>
                        {user.metricas.promedio_entrevistas && (
                          <div className="user-metric-label">
                            <Star size={12} /> {user.metricas.promedio_entrevistas}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.ultimo_acceso
                        ? new Date(user.ultimo_acceso).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Nunca"}
                    </td>
                    <td className="center">
                      <div className="user-actions-cell">
                        <button
                          onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                          className="user-details-btn"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={() => openDeleteModal(user.id, user.nombre)}
                          className="user-delete-btn"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.total_pages > 1 && (
            <div className="user-list-pagination">
              <div className="pagination-info">
                Mostrando{" "}
                <span>{(filters.page - 1) * filters.limit + 1}</span> a{" "}
                <span>{Math.min(filters.page * filters.limit, pagination.total)}</span> de{" "}
                <span>{pagination.total}</span> resultados
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <span className="pagination-current">
                  {filters.page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.total_pages}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {deleteModal.isOpen && (
          <div className="delete-modal-overlay" onClick={closeDeleteModal}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-header">
                <div className="delete-modal-icon">
                  <Trash2 size={24} />
                </div>
                <h2 className="delete-modal-title">Eliminar Usuario</h2>
              </div>

              <div className="delete-modal-body">
                <p className="delete-modal-text">
                  ¿Estás seguro de que deseas eliminar al usuario <strong>{deleteModal.userName}</strong>?
                </p>
                <p className="delete-modal-warning">
                  Esta acción eliminará permanentemente:
                </p>
                <ul className="delete-modal-list">
                  <li>Todos los CVs subidos por el usuario</li>
                  <li>Todas las entrevistas realizadas</li>
                  <li>Todos los informes generados</li>
                  <li>Toda la información asociada a su cuenta</li>
                </ul>
                <p className="delete-modal-alert">
                  <strong>Esta acción no se puede deshacer.</strong>
                </p>
              </div>

              <div className="delete-modal-footer">
                <button
                  onClick={closeDeleteModal}
                  className="delete-modal-btn delete-modal-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="delete-modal-btn delete-modal-confirm"
                >
                  <Trash2 size={16} />
                  Eliminar Usuario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default UserList;
