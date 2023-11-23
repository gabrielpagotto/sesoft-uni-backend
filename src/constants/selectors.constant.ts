export const listPostSelector = {
    id: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    likesCount: true,
    repliesCount: true,
    likes: true,
    user: {
        select: {
            id: true,
            email: true,
            username: true,
            profile: {
                select: {
                    displayName: true,
                    bio: true,
                    icon: true,
                },
            },
        },
    },
};
