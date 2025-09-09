export interface AuthKioskResponse {
    resultCode: string;
    resultData: {
        token: string,
    }
}

export interface AuthUserResponse {
    resultCode: string;
    resultData: {
        "measureid": string,
        "username": string,
        "nextstep": string,
        "status": 1,
        "gender": string,
        "birthday": string,
        "phonenumber": string
    }

}