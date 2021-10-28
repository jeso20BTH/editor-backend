getUserDocs = async () => {
    let users = await axios.get('http://localhost:666/users');
    let docs = await axios.get('http://localhost:666/docs');

    let usersWithDocs = [];

    users.map((user) => {
        let userId = user.id;
        user.docs = [];

        docs.map((doc) => {
            if (doc.userId === userId) {
                user.docs.push(doc);
            }
        })

        usersWithDocs.push(user);
    })

    return usersWithDocs
}
