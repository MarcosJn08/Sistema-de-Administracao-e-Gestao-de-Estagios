import React from "react";

const GoogleButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "10px 20px",
        backgroundColor: "#ffffff",
        border: "1px solid #dadce0",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "15px",
        color: "#3c4043",
        fontFamily: "inherit",
        fontWeight: "600",
        minHeight: "46px",
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        style={{ width: "20px", height: "20px", marginRight: "12px" }}
      />
      Login com Google
    </button>
  );
};

export default GoogleButton;
