import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <div className="login-page">
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center py-5">
          <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;