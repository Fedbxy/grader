import prisma from "@/lib/prisma";
import Link from "next/link";

export async function Announcement() {
    const announcements = await prisma.announcement.findMany({
        orderBy: {
            id: "asc",
        },
        where: {
            visibility: "public",
        },
        include: {
            author: true,
        },
    });

    if (!announcements || announcements.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-bold text-center mb-6">Announcements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            By{" "}
                            <Link
                                href={`/user/${announcement.author.id}/profile`}
                                className="text-blue-500 hover:underline"
                            >
                                {announcement.author.displayName}
                            </Link>
                        </p>
                        <Link
                            href={`/announcement/${announcement.id}`}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Read more →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
