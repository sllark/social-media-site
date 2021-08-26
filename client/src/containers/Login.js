import React from "react";
import {Link} from "react-router-dom"


import * as validate from '../helper/formValidation'

import FillScreen from "../components/FillScreen";
import homeImage from "../assets/img/homeImage.png"
import configs from "../assets/config/configs";
import axios from "../helper/axios";

class Login extends React.Component {

    state = {
        form: {
            email: {
                value: "",
                errorMessage: "Please enter a valid email.",
                isValid: true,
                validate: () => validate.validateEmail(this.state.form.email.value)
            },
            password: {
                value: "",
                errorMessage: "Password should be more than 6 characters.",
                isValid: true,
                validate: () => validate.minLength(this.state.form.password.value, 6),
            }
        }

    }


    changeHandler = (e) => {
        const target = e.target;
        const name = target.name;


        this.setState((prevState) => {

            return {
                ...prevState,
                form: {
                    ...prevState.form,

                    [name]: {
                        ...prevState.form[name],
                        value: target.value
                    }

                }

            }

        })


    }


    onFormSubmit = (e) => {
        e.preventDefault();


        let form = {...this.state.form},
            isFormValid = true;

        for (const property in form) {
            form[property].isValid = form[property].validate();
            if (!form[property].isValid) isFormValid = false;
        }

        this.setState({
            form: form
        })


        if (!isFormValid) return;

        let link = configs.api_url;

        axios({
            method: 'post',
            url: link + "/login",
            headers: {
                "content-type": "application/json"
            },
            data: {
                email: form.email.value,
                password: form.password.value,
            }
        })
            .then(result => {

                let data = result.data;


                localStorage.setItem('token', data.token)
                localStorage.setItem('userID', data.userID)
                localStorage.setItem('name', data.name)

                this.props.updateToken(data);

            })
            .catch(error => {
                console.log(error);
            })

    }


    render() {


        return (
            <FillScreen class="home login flex-center">

                <div className="home__container container flex-row">

                    <div className="home__container__text flex-center flex-column">
                        <h1>Login to Connect</h1>
                        <p>
                            Lito helps you connect and share with the people in your life.
                        </p>
                        <img src={homeImage} alt="girl in phone with likes,comments and shares"/>
                    </div>

                    <div className="home__container__form flex-center flex-column loginForm">

                        <form action="#" onSubmit={this.onFormSubmit}>

                            <label>
                                <p>
                                    Email
                                </p>
                                <span>
                                    {
                                        !this.state.form.email.isValid ? this.state.form.email.errorMessage : ""
                                    }
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john.doe@example.com"
                                    value={this.state.form.email.value}
                                    onChange={this.changeHandler}
                                    className={!this.state.form.email.isValid ? "invalid" : ""}
                                />
                            </label>


                            <label>
                                <p>
                                    Password
                                </p>
                                <span>
                                    {
                                        !this.state.form.password.isValid ? this.state.form.password.errorMessage : ""
                                    }
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={this.state.form.password.value}
                                    onChange={this.changeHandler}
                                    className={!this.state.form.password.isValid ? "invalid" : ""}

                                />
                            </label>


                            <input type="submit" className="btn btn--secondary" value="LOGIN"/>
                        </form>


                        <p className="home__container__form__loginLink">
                            New Here?
                            <Link to="/">
                                Create Account
                            </Link>
                        </p>


                    </div>


                </div>

            </FillScreen>
        );

    }

}


export default Login;
