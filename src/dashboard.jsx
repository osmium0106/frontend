import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProfileForm from "./Components/ProfileSetting";
import Card from "./UIcomponents/card";
import { fetchStudentDashboard, logout } from "./apiservice";
import "./sidebar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Profilecard from "./UIcomponents/Profilecard";
import Loader from "./UIcomponents/loader";
import Progressreport from "./UIcomponents/Progressreport";
import AssessmentReport from "./UIcomponents/AssesmentReport";
import AssignmentSubmission from "./UIcomponents/Assignments";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "";
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  useEffect(() => {
    if (isAuthenticated !== "true") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetchStudentDashboard(username);
        if (result.success) {
          console.log(result.data); // Debugging the response
          setData(result.data);
        } else {
          setError("An error occurred while fetching dashboard data.");
        }
      } catch (error) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username, navigate]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      localStorage.clear();
      navigate("/login");
    } else {
      setError("Logout failed.");
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case "dashboard":
        return (
          <div className="maindash">
            <Profilecard
              name={data?.profile?.name}
              grade={data?.profile?.grade}
              loginCount={data?.login_count}
            />
          </div>
        );
      case "subjects":
        return (
          <div className="subject-cards-container">
            {data?.subjects?.length > 0
              ? data.subjects.map((subject) => (
                  <div key={subject.id}>
                    <Link to={`/learning/${data.profile.grade}/${subject.slug}/`}>
                      <Card
                        title={subject.name}
                        image={subject.image}
                        description={subject.description || "No description available."}
                      />
                    </Link>
                  </div>
                ))
              : "No subjects available."}
          </div>
        );
      case "progress":
        return <AssessmentReport />;
      case "assessment":
        return <Progressreport />;
      case "quizzes":
        return (
          <div>
            <iframe
              src="https://quizizz.com/embed/quiz/66571b0198406433bf45c46c"
              width="100%"
              height="660"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        );
      case "projects":
        return <AssignmentSubmission />;
      case "events":
        return <div>Upcoming Events Will be here...</div>;
      case "profileSetting":
        return <ProfileForm onClose={() => setActiveContent("subjects")} />;
      default:
        return <div>Select an option</div>;
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="sidebar-profile">
          <img
            src={data?.profile?.profile_pic || "https://via.placeholder.com/80"}
            alt="Profile"
            className="profile-image"
          />
          {!isCollapsed && (
            <div className="profile-info">
              <div className="profile-name">{data?.profile?.name}</div>
              <div className="profile-grade">Class - {data?.profile?.grade}</div>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          {[
            { label: "Dashboard", key: "dashboard", icon: "bi-house" },
            { label: "Subjects", key: "subjects", icon: "bi-book" },
            { label: "Progress Report", key: "progress", icon: "bi-graph-up" },
            { label: "Assessment Report", key: "assessment", icon: "bi-check2-square" },
            { label: "Quizzes & Assessments", key: "quizzes", icon: "bi-question-circle" },
            { label: "Innovative Projects", key: "projects", icon: "bi-lightbulb" },
            { label: "Upcoming Events", key: "events", icon: "bi-calendar-event" },
            { label: "Profile Setting", key: "profileSetting", icon: "bi-gear" },
          ].map((item) => (
            <div
              key={item.key}
              className={`sidebar-item ${activeContent === item.key ? "active" : ""}`}
              onClick={() => setActiveContent(item.key)}
            >
              <i className={`bi ${item.icon} sidebar-icon`}></i>
              {!isCollapsed && <span className="sidebar-text">{item.label}</span>}
            </div>
          ))}
        </div>

        <div className="logout-section">
          <div className="sidebar-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right sidebar-icon"></i>
            {!isCollapsed && <span className="sidebar-text">Logout</span>}
          </div>
        </div>
      </div>

      <div className="content-panel">{renderContent()}</div>
    </div>
  );
};

StudentDashboard.propTypes = {
  data: PropTypes.shape({
    profile: PropTypes.shape({
      grade: PropTypes.string.isRequired,
      name: PropTypes.string,
      profile_pic: PropTypes.string,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired,
      }),
    }),
    subjects: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        description: PropTypes.string,
        slug: PropTypes.string,
      })
    ),
  }),
};

export default StudentDashboard;
