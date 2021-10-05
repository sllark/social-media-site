import React, {useRef, useState} from "react";
import {Link} from "react-router-dom";

import profile from "../../assets/img/avatar.png";
import ProfileHeaderOptions from "../ui/ProfileHeaderOptions";
import ImageModal from "../ui/ImageModal";
import ImageEditor from "../ui/ImageEditor";
import AddBio from "./AddBio";

import dataURLtoFile from "../../helper/dataURLtoFile";
import configs from "../../assets/config/configs";
import axiosInstance from "../../helper/axios";
import handleAxiosError from "../../helper/handleAxiosError";
import {postImage} from "../../helper/postImage";

function ProfileHeader(props) {

    //props:
    // user
    // addNewPost
    // setResponsePreview


    const profileimageRef = useRef();
    const coverImageRef = useRef();
    const coverIputRef = useRef();
    const profileInputRef = useRef();

    const [hideProfileOpt, setProfileOpt] = useState(true);
    const [hideCoverOpt, setCoverOpt] = useState(true);

    const [viewProfile, setViewProfile] = useState(false);
    const [viewCover, setViewCover] = useState(false);


    const [image, setImage] = useState(undefined);
    const [cropImageProfile, setCropImageProfile] = useState(undefined);
    const [cropImageCover, setCropImageCover] = useState(undefined);

    const [originalName, setOriginalName] = useState("");
    const [readingImage, setReadingImage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [isLoading, setLoading] = useState(false);


    const imageChangeHandler = (e, imageType) => {

        if (e.target.files.length === 0) return;

        var file = e.target.files[0];
        setOriginalName(file.name);

        let reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = (e) => {
            setImage(reader.result);

            if (imageType === "profile") {
                setCropImageProfile(reader.result);
            } else {
                setCropImageCover(reader.result);
            }

            setReadingImage(imageType);
            setShowModal(true);
        }

    }


    const setData = (data) => {

        if (readingImage === "profile") {
            setCropImageProfile(data);
            clearInput(profileInputRef)
        } else if (readingImage === "cover") {
            setCropImageCover(data);
            clearInput(coverIputRef)
        }

        postProfile(readingImage, data);

    }


    const clearInput = (inputRef) => {
        inputRef.current.value = "";
    }


    const postProfile = async (imageType = "profile", imgData) => {

        setLoading(true);

        let file, fileUrl = "";

        let path = "/updateProfilePic";
        if (imageType === "cover") path = "/updateCoverPic";

        file = dataURLtoFile(imgData, originalName);
        fileUrl = await postImage(file, props);

        axiosInstance.post(path,
            {
                fileUrl: fileUrl
            })
            .then(result => {
                props.addNewPost(result.data.post)
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Failed to  update image.")
            })
            .then(result => {
                setLoading(false);
                setShowModal(false)
            })

    }


    const profileImgClick = () => {
        if (props.user._id !== localStorage.getItem('userID'))
            setViewProfile(true);
        else
            setProfileOpt(!hideProfileOpt);
    }


    const coverImgClick = () => {
        if (props.user._id !== localStorage.getItem('userID') && coverSrc !== "")
            setViewCover(true);
        else
            setCoverOpt(!hideProfileOpt);

    }


    const unfriendUser = () => {


        axiosInstance.post(
            "/unfriend",
            JSON.stringify({
                userID: props.user._id
            }))
            .then(result => {

                if (result.data.message === "success") {
                    props.updateUser("isMyFriend", false)
                }

            })
            .catch(error => {

                handleAxiosError(error, props.setResponsePreview, "Failed to unfriend.")

            })

    }


    const sendFriendReq = () => {

        if (props.user.reqSent) return;

        let id = props.user._id;


        axiosInstance.post(
            "/sendFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {

                if (result.data.message === "success") {
                    props.updateUser("reqSent", true)
                }

            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Failed to send request.")

            })


    }

    const cancelReq = () => {

        if (!props.user.reqSent) return;

        let id = props.user._id;

        axiosInstance.post(
            "/cancelFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {

                if (result.data.message === "success" || result.data.errorMessage === "No Request to cancel") {
                    props.updateUser("reqSent", false)
                }

            })
            .catch(error => {

                handleAxiosError(error, props.setResponsePreview, "Failed to cancel request.")

            })


    }


    const acceptReq = () => {
        let id = props.user._id;

        axiosInstance.post(
            "/acceptFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success")
                    props.updateUser("reqRecieved", false)
                props.updateUser("isMyFriend", true)
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not accept request right now.")
            })


    }

    const declineReq = () => {
        let id = props.user._id;

        axiosInstance.post(
            "/declineFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success")
                    props.updateUser("reqRecieved", false)
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not decline request right now.")

            })


    }


    let coverSrc = cropImageCover ? cropImageCover : props.user.coverPicture;
    let profilSrc = cropImageProfile ? cropImageProfile : props.user.profilePicture;


    let isMyProfile = props.user._id === localStorage.getItem('userID');


    let reqBtn = null;
    if (!props.user.isMyFriend && !props.user.reqSent && !props.user.reqRecieved) {

        reqBtn = <button className="btn btn--transparent mr-1" onClick={sendFriendReq}>Send Friend Request</button>;

    } else if (!props.user.isMyFriend && props.user.reqSent) {

        reqBtn = <button className="btn btn--transparent mr-1" onClick={cancelReq}>Cancel Request</button>;

    } else if (!props.user.isMyFriend && props.user.reqRecieved) {

        reqBtn = (
            <>
                <button className="btn btn--transparent mr-1" onClick={acceptReq}>Accept Request</button>
                <button className="btn btn--transparent mr-1" onClick={declineReq}>Decline Request</button>
            </>)


    } else if (props.user.isMyFriend) {

        reqBtn = <button className="btn btn--transparent mr-1"
                         onClick={unfriendUser}>Unfriend</button>;
    }

    return (
        <>

            <div className="profileHeader">


                <div className="profileHeader__photo">

                    <div className="profileHeader__photo__cover" ref={coverImageRef}>
                        {
                            coverSrc ?
                                <img src={coverSrc} onClick={coverImgClick} alt="cover"/>
                                : <div className="profileHeader__photo__cover__gradient" onClick={coverImgClick}/>
                        }

                        {
                            isMyProfile ?
                                <ProfileHeaderOptions
                                    changeHideOptions={setCoverOpt}
                                    hideOptions={hideCoverOpt}
                                    imageRef={coverImageRef}
                                    coverOptions={true}
                                >
                                    <li>
                                        <button onClick={() => setViewCover(!viewCover)}>
                                            View Cover Picture
                                        </button>
                                    </li>
                                    <li>
                                        <button>
                                            <input
                                                type="file"
                                                id="coverInput"
                                                className="hideInput"
                                                onClick={(e) => {
                                                    if (!isLoading) return;
                                                    e.preventDefault();
                                                    setShowModal(true);
                                                }}
                                                onChange={(e) => imageChangeHandler(e, "cover")}
                                                ref={coverIputRef}
                                            />

                                            <label htmlFor="coverInput">Change Picture</label>
                                        </button>
                                    </li>

                                </ProfileHeaderOptions> : null
                        }


                    </div>

                    <div className="profileHeader__photo__profile" ref={profileimageRef}>
                        <img src={profilSrc} onClick={profileImgClick} alt="profile"/>
                        {
                            isMyProfile ?
                                <ProfileHeaderOptions
                                    changeHideOptions={setProfileOpt}
                                    hideOptions={hideProfileOpt}
                                    imageRef={profileimageRef}
                                >
                                    <li>
                                        <button onClick={() => setViewProfile(!viewProfile)}>
                                            View Profile Picture
                                        </button>
                                    </li>
                                    <li>
                                        <button>
                                            <input
                                                type="file"
                                                id="profileInput"
                                                className="hideInput"
                                                onClick={(e) => {
                                                    if (!isLoading) return;
                                                    e.preventDefault();
                                                    setShowModal(true);
                                                }}
                                                onChange={(e) => imageChangeHandler(e, "profile")}
                                                ref={profileInputRef}
                                            />
                                            <label htmlFor="profileInput">Change Picture</label>
                                        </button>
                                    </li>

                                </ProfileHeaderOptions>
                                : null
                        }

                    </div>

                </div>


                <h3 className="profileHeader__name">
                    {props.user.firstName + " " + props.user.lastName}
                </h3>

                {
                    props.user.bio ?
                        <h4 className="profileHeader__bio">
                            {props.user.bio}
                        </h4>
                        : null
                }


                {
                    isMyProfile ?
                        <AddBio
                            user={props.user}
                            updateBio={(value) => props.updateUser('bio', value)}
                            haveBio={!!props.user.bio}
                            setResponsePreview={props.setResponsePreview}/> :

                        <div className="profileHeader__buttons">
                            <Link className={"btn btn--transparent" + (props.friendsHeader ? " active" : "")}
                                  to={"/friends/" + props.user._id}>Friends</Link>
                            {reqBtn}
                            <Link className="btn btn--transparent" to={"/messanger/" + props.user._id}>Message</Link>

                        </div>
                }


            </div>


            {
                viewProfile ?
                    <ImageModal
                        showModal={viewProfile}
                        changeShowModal={setViewProfile}
                        postImage={profilSrc}
                    />
                    : null
            }

            {
                viewCover ?
                    <ImageModal
                        showModal={viewCover}
                        changeShowModal={setViewCover}
                        postImage={coverSrc}
                    />
                    : null
            }

            <ImageEditor
                showEditor={showModal}
                changeShowEditor={setShowModal}
                image={image}
                setCropImage={setData}
                isProfileCropper={readingImage === "profile"}
                onProfilePage={readingImage === "profile" || readingImage === "cover"}
                isLoading={isLoading}
            />

        </>

    );
}


export default ProfileHeader;






