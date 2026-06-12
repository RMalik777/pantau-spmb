export type Madrasah = {
	lokasi_id: number;
	nama: string;
	npsn: number;
	alamat: string;
	kota: string;
	propinsi: string;
};

export type DaftarRow = [
	rank: number,
	no_pendaftaran: string,
	nisn: string,
	nama: string,
	asal_sekolah: string,
	nilai: string,
];

export type DaftarResponse = {
	sekolah: {
		lokasi_id: number;
		nama: string;
		npsn: number;
		is_negeri: boolean;
		kota: string;
		propinsi: string;
	};
	data: DaftarRow[];
	rekap: unknown[];
	rows_per_page: number;
	signature: string;
};
