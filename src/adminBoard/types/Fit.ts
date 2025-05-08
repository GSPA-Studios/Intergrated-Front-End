export interface Fit {
  id: string;
  filename: string;
  filepath: string;
  date: string;  // ISO date string
  observer: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  url: string;   // Download URL
  
  // FITS specific metadata fields
  exposure_time?: number;
  date_of_observation?: string;
  object_name?: string;
  filter?: string;
  ra_of_image?: string;
  dec_of_image?: string;
  temp_of_detector?: number;
  julian_date?: number;
  gain?: number;
  airmass?: number;
  observer_code?: string;
  BITPIX?: number;
  NAXIS1?: number;
  NAXIS2?: number;
  XPIXSZ?: number;
  XBINNING?: number;
  YBINNING?: number;
  XORGSUBF?: number;
  YORGSUBF?: number;
  READOUTM?: string;
  IMAGETYP?: string;
  EGAIN?: number;
  OFFSET?: number;
  FOCUSPOS?: number;
  OBJCTALT?: number;
  OBJCTHA?: number;
  OBJCTAZ?: number;
  INSTRUME?: string;
  XPIXSCAL?: number;
  COOLPOWR?: number;
  COOLERON?: boolean;
  CAMNAME?: string;
  WIDTH?: number;
  HEIGHT?: number;
  XPIXSIZE?: number;
  TELALT?: number;
  TELAZ?: number;
  FOCPOS?: number;
  BLKNAME?: string;
  BLKSTART?: string;
  BLKEND?: string;
  BLKRA?: string;
  BLKDEC?: string;
  BLKCODE?: string;
  BLKTITL?: string;
  BLKTYPE?: string;
  BLKFILT?: string;
  BLKSCH?: string;
  LASTAUTO?: string;
  AUTOINT?: number;
  CENTERED?: boolean;
} 