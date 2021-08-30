import React from "react";
import {Link, Redirect} from "react-router-dom"

import configs from "../assets/config/configs";
import * as validate from "../helper/formValidation";
import axios from "../helper/axios";


import FillScreen from "../components/FillScreen";
import homeImage from "../assets/img/homeImage.png"
import Loading from "../components/ui/Loading";


class Signup extends React.Component {


    state = {
        form: {
            firstName: {
                value: "",
                errorMessage: "Please enter First Name.",
                isValid: true,
                validate: () => validate.minLength(this.state.form.firstName.value, 1),
            },
            lastName: {
                value: "",
                errorMessage: "Please enter Last Name.",
                isValid: true,
                validate: () => validate.minLength(this.state.form.lastName.value, 1),
            },
            dob: {
                value: "",
                errorMessage: "Please enter your date of birth.",
                isValid: true,
                validate: () => validate.minLength(this.state.form.dob.value, 1),
            },
            gender: {
                value: "male",
                errorMessage: "Please select your gender.",
                isValid: true,
                validate: () => validate.minLength(this.state.form.gender.value, 1),
            },
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
        },
        isLoading: false,
        errorMsg: "",
        redirect: undefined

    }


    componentDidMount() {
        if (localStorage.getItem('token')) this.setState({redirect:"/feed"})
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

        this.setState({
            isLoading: true,
            errorMsg: ""
        })

        let link = configs.api_url;

        axios({
            method: 'post',
            url: link + "/signup",
            headers: {
                "content-type": "application/json"
            },
            data: {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                gender: form.gender.value,
                email: form.email.value,
                dob: form.dob.value,
                password: form.password.value,
            }
        })
            .then(result => {
                this.props.updateToken(result.data);
                this.setState({redirect: "/feed"})

            })
            .catch(error => {
                console.log(error.response);
                if (error.response)
                    this.setState({errorMsg: error.response.data.message})
                else
                    this.setState({errorMsg: "Internal Server Error."})

            })
            .then(() => {
                this.setState({isLoading: false})
            })


    }


    render() {

        if (this.state.redirect)
            return <Redirect to={this.state.redirect}/>

        return (
            <FillScreen class="home flex-center">

                <div className="home__container container flex-row">

                    <div className="home__container__text flex-center flex-column">
                        <h1>Create new account</h1>
                        <p>
                            Get started with Lito and connect with your friends and family.
                        </p>
                        <img src={homeImage} alt="girl in phone with likes,comments and shares"/>
                    </div>

                    <div className="home__container__form flex-center flex-column">

                        {!this.state.isLoading ?
                            <>
                                {
                                    this.state.errorMsg !==""?
                                        <p className="formErrorMsg">
                                            {this.state.errorMsg}
                                        </p> : null
                                }
                                <form action="#" onSubmit={this.onFormSubmit}>

                                    <div className="formGroup">

                                        <label>
                                            <p>
                                                First Name
                                            </p>
                                            <span>
                                    {
                                        !this.state.form.firstName.isValid ? this.state.form.firstName.errorMessage : ""
                                    }
                                </span>
                                            <input
                                                type="text"
                                                placeholder="John"
                                                name="firstName"
                                                value={this.state.form.firstName.value}
                                                onChange={this.changeHandler}
                                                className={!this.state.form.firstName.isValid ? "invalid" : ""}
                                            />
                                        </label>

                                        <label>
                                            <p>
                                                Last Name
                                            </p>
                                            <span>
                                    {
                                        !this.state.form.lastName.isValid ? this.state.form.lastName.errorMessage : ""
                                    }
                                </span>
                                            <input
                                                type="text"
                                                placeholder="Doe"
                                                name="lastName"
                                                value={this.state.form.lastName.value}
                                                onChange={this.changeHandler}
                                                className={!this.state.form.lastName.isValid ? "invalid" : ""}
                                            />
                                        </label>

                                    </div>

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
                                            placeholder="john.doe@example.com"
                                            name="email"
                                            value={this.state.form.email.value}
                                            onChange={this.changeHandler}
                                            className={!this.state.form.email.isValid ? "invalid" : ""}
                                        />
                                    </label>


                                    <div className="formGroup">


                                        <label>
                                            <p>
                                                Date of Birth
                                            </p>
                                            <span>
                                        {
                                            !this.state.form.dob.isValid ? this.state.form.dob.errorMessage : ""
                                        }
                                    </span>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={this.state.form.dob.value}
                                                onChange={this.changeHandler}
                                                className={!this.state.form.dob.isValid ? "invalid" : ""}
                                            />
                                        </label>


                                        <label>
                                            <p>
                                                Gender
                                            </p>
                                            <span>
                                    {
                                        !this.state.form.gender.isValid ? this.state.form.gender.errorMessage : ""
                                    }
                                    </span>
                                            <select name="gender" id="gender"
                                                    value={this.state.form.gender.value}
                                                    onChange={this.changeHandler}
                                                    className={!this.state.form.gender.isValid ? "invalid" : ""}
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </label>


                                    </div>

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
                                            placeholder="Password"
                                            name="password"
                                            value={this.state.form.password.value}
                                            onChange={this.changeHandler}
                                            className={!this.state.form.password.isValid ? "invalid" : ""}

                                        />
                                    </label>


                                    <input type="submit" className="btn btn--secondary" value="CREATE ACCOUNT"/>
                                </form>
                                <p className="home__container__form__loginLink">
                                    Already have account?
                                    <Link to="/login">
                                        Log in
                                    </Link>
                                </p>
                            </>
                            : <Loading/>
                        }

                    </div>


                </div>

            </FillScreen>
        );

    }

}


export default Signup;
