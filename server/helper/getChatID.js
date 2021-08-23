const getChatId = (idA, idB) => {

    idA = String(idA);
    idB = String(idB);

    if (idA > idB)
        return idB + idA;
    else
        return idA + idB;
}


module.exports = getChatId;
