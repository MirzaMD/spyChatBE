import {genSaltSync, hashSync,compareSync} from "bcrypt";
export const hashing = (password)=>{
    const salts=10;
    const saltRounds = genSaltSync(salts);
    const hashedPassword = hashSync(password,saltRounds);
    return hashedPassword;
}
export const unhash = (plain, hashed) =>{
    const pass = compareSync(plain,hashed);
    return pass;
}