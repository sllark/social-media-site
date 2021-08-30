import {Route,Redirect} from "react-router-dom"

const PrivateRoute = (props) => {

    return localStorage.getItem("userID") ? (
        <Route {...props} />
    ) : (
        <Redirect
            to={{
                pathname: "/login",
            }}
        />
    );
};

export default PrivateRoute