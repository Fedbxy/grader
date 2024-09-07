const protocol = process.env.BACKEND_PROTOCOL;
const endpoint = process.env.BACKEND_ENDPOINT;
const port = process.env.BACKEND_PORT;

export async function uploadTestcase(id: number, file: File) {
    const data = new FormData();
    data.append("file", file);

    const response = await fetch(`${protocol}://${endpoint}:${port}/testcase/${id}/upload`, {
        method: "POST",
        body: data,
    });

    if (!response.ok) {
        return "Failed to upload testcase.";
    }
}