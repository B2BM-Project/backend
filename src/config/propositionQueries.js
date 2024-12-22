module.exports = {
    // Sample query to fetch all propositions

    getAllProposition: 'SELECT * FROM proposition',

    getPropositionById: 'SELECT * FROM PROPOSITION WHERE Proposition_id = ?',
    createProposition: `
        INSERT INTO PROPOSITION (
            Proposition_name,
            Proposition_detail,
            Proposition_detail_img,
            Type_id,
            Level,
            Catagory,
            Flag,
            Score,
            File
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    updateProposition: `
        UPDATE PROPOSITION 
        SET 
            Proposition_name = ?, 
            Proposition_detail = ?, 
            Proposition_detail_img = ?, 
            Type_id = ?, 
            Level = ?, 
            Catagory = ?, 
            Flag = ?, 
            Score = ?, 
            File = ? 
        WHERE Proposition_id = ?
    `,
    deleteProposition: 'DELETE FROM PROPOSITION WHERE Proposition_id = ?'
};
