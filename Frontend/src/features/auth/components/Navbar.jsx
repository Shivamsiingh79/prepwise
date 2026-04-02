import React from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {

    const { user, handleLogout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            navigate("/login");
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "1rem",
            borderBottom: "1px solid #2a3348"
        }}>

            <h2>Resume Builder</h2>

            <div>

                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" style={{ marginLeft: "1rem" }}>
                            Register
                        </Link>
                    </>
                )}

                {user && (
                    <>
                        <span style={{ marginRight: "1rem" }}>
                            Hi, {user.username}
                        </span>

                        <button onClick={handleLogoutClick} disabled={loading}>
                            {loading ? "Logging out..." : "Logout"}
                        </button>
                    </>
                )}

            </div>

        </nav>
    );
};

export default Navbar;