import React from "react";


function Input(props) {



    return (
        <input type="text"
               placeholder={props.placeholder || ""}
               value={props.value || ""}
               onChange={e => {
                   props.onChange(e.target.value)
               }}
        />
    );

}


export default Input;
