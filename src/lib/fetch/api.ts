import ky from "ky";

export const api = ky.create({
	baseUrl: "https://api-jkt.spmb.id/",
});
