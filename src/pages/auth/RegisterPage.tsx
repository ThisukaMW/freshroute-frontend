// This is just a wrapper — it renders RoleSelectPage when someone navigates to /register

import React from "react";
import RoleSelectPage from "../RoleSelectPage";

const RegisterPage: React.FC = () => {
  // Nothing here — just passes straight through to RoleSelectPage
  return <RoleSelectPage />;
};

export default RegisterPage;