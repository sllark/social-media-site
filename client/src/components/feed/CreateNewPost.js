import React, {useEffect, useRef, useState} from "react";

import axiosInstance from "../../helper/axios";
import {postImage} from "../../helper/postImage";


import configs from "../../assets/config/configs";
import Modal from "../ui/Modal";
import Avatar from "../profile/Avatar";
import NameDisplay from "../ui/NameDisplay";
import ImageUploader from "../general/ImageUploader";

import dataURLtoFile from "../../helper/dataURLtoFile"
import handleAxiosError from "../../helper/handleAxiosError";
import Loading from "../ui/Loading";


function CreateNewPost(props) {


    useEffect(() => {
        if (!isLoading) inputEl.current.focus();
    });

    const [postText, changeText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [clearImage, setClearImage] = useState(false);
    const [cropImage, setCropImage] = useState("");
    const [imageOrignalName, setImageOriginalName] = useState("")
    const [isLoading, setLoading] = useState(false)

    const inputEl = useRef(null);



    const createPost = async (e) => {

        setLoading(true)

        let file = "";
        let fileUrl = "";


        if (cropImage) {
            file = dataURLtoFile(cropImage, imageOrignalName);
            fileUrl = await postImage(file, props);
        }



        axiosInstance.post("/createPost",
            {
                postText: postText,
                fileUrl: fileUrl
            })
            .then(result => {
                changeText("");
                props.addNewPost(result.data.post);
                setClearImage(true);
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Loading Failed...")
            })
            .then(() => {
                setLoading(false)
                setShowModal(false);
            })


    }

    let avatarSrc = props.user?.profilePicture || "";

    return (
        <>
            <div className="createNewPost">

                <div className="createNewPost__front d-flex">

                    <Avatar isActive={true} url={avatarSrc}/>
                    <input type="text"
                           value={postText}
                           placeholder={props.placeholder}
                           onChange={e => {
                               e.preventDefault();
                               // e.target.blur();
                               // changeText(e.target.value)
                           }}
                           onClick={e => {
                               e.preventDefault();
                               e.target.blur();
                               setShowModal(true);
                           }}
                           onFocus={e => {
                               e.preventDefault();
                               e.target.blur();
                               setShowModal(true);
                           }}
                    />

                </div>

            </div>

            <Modal showModal={showModal} changeShowModal={setShowModal}>
                <h2>Create Post</h2>
                <div className={'modalBody' + (isLoading ? ' justify-content-between' : '')}>

                    <NameDisplay user={props.user}/>

                    {
                        isLoading ?
                            <Loading/> :
                            <>
                                <textarea
                                    ref={inputEl}
                                    placeholder={props.placeholder}
                                    value={postText}
                                    onChange={e => {
                                        e.preventDefault();
                                        // e.target.blur();
                                        changeText(e.target.value)
                                    }}
                                />
                                <ImageUploader
                                    clearImage={clearImage}
                                    setClearImage={setClearImage}
                                    cropImage={cropImage}
                                    setCropImage={setCropImage}
                                    setImageOriginalName={setImageOriginalName}
                                />
                            </>

                    }


                    <button
                        className="btn btn--primary"
                        disabled={postText.length < 1 || isLoading}
                        onClick={createPost}
                    >
                        {!isLoading ? 'Post' : 'Posting...'}
                    </button>

                </div>
            </Modal>
        </>
    );

}


export default CreateNewPost;
