class Validator {

    static checkbio(bio) {
        const patternBio = /^[A-Za-z0-9]{1,}$/

        if (bio.match(patternBio))
            return true;
        return false;
    }

    static checkUsername(username) {
        const patternUsername = /^[A-Za-z0-9_-]{6,30}$/;

        if (username.match(patternUsername))
            return true;
        return false;

    }

    static checkEmail(email) {
        const patternEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (email.match(patternEmail))
            return true;
        return false;

    }

    static checkName(name) {
        const patternName = /^[A-Za-z]{1,30}$/;
        if (name.match(patternName))
            return true;
        return false;

    }

    static checkPassword(password) {
        const patternPassword = /^((?=.*\d)(?=.*[A-Z])(?=.*\W).{6,})$/;

        if (password.match(patternPassword))
            return true;
        return false;

    }

    static checkInterest(interest) {
        const interestPattern = /^(?=.*[a-zA-Z])|((?=.*[a-zA-Z])(?=.*[0-9\W]))$/

        if (interest.match(interestPattern))
            return true;
        return false;
    }

    static checkLength(value, len) {
        if (value.length <= len)
            return true;
        return false;
    }

}

module.exports = Validator;