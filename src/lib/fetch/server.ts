import ky from "ky";

export const api = ky.create({
	baseUrl: "https://pmb-madrasahdki.com/",
	timeout: 10000,
	retry: 0,
});
