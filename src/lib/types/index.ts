export type Madrasah = {
	lokasi_id: number;
	sekolah_id: number;
	siap_id: number;
	nama: string;
	npsn: number;
	is_dinas: boolean;
	is_negeri: boolean;
	is_sbi: boolean;
	no_telp: string;
	alamat: string;
	k_kota: number;
	k_propinsi: number;
	kota: string;
	propinsi: string;
	latitude: number | null;
	longitude: number | null;
	logo: string;
};

export type DaftarRow = {
	rank: number;
	no_peserta: string;
	nama: string;
	nilai: string;
	umur: string;
	timestamp: string;
	asal_sekolah: string | null;
};

export type DaftarResponse = {
	sekolah: {
		lokasi_id: number;
		sekolah_id: number;
		nama: string;
		npsn: number;
		is_negeri: boolean;
		kota: string;
		propinsi: string;
	};
	kompetensi: string;
	enable: boolean;
	jml_pagu: number;
	jml_luar: number | null;
	data: DaftarRow[];
	rekap: unknown[];
	rows_per_page: number;
	signature: string;
};

export type DetailProperty = {
	key: string | null;
	label: string;
	value: string | number;
};

export type DetailSection = {
	id: string | null;
	header: string;
	description: string | null;
	metadata?: Record<string, string | number>;
	properties: DetailProperty[];
	children?: DetailSection[];
};

export type DetailResponse = {
	success: boolean;
	data: DetailSection[];
};
