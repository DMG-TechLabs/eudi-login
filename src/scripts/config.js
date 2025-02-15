class Config {
    constructor(config = {
        AgeOver18: false,
        HealthID: false,
        IBAN: false,
        Loyalty: false,
        mDL: false,
        MSISDN: false,
        PhotoId: false,
        PID: false,
        PowerOfRepresentation: false,
        PseudonymDeferred: false,
        Reservation: false,
        TaxNumber: false
    }){
        this.settings = config
    }
}
