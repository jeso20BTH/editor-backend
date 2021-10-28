getUserDocs = async () => {
    let body = `{
        user {
            name
            docs {
                name
            }
        }
    }`;

    let usersWithDocs = await axios.post(
        'http://localhost:666/users',
        JSON.stringify(body)
    );

    return usersWithDocs
}
