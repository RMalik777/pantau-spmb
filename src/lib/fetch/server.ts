import ky from "ky";

export const api = ky.create({
	baseUrl: "https://pmb-madrasahdki.com/",
});
