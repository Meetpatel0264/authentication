import RegisterForm from "../components/RegisterForm";

const Register = () => {
  return (
    <div className="register-page">
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center py-5">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;