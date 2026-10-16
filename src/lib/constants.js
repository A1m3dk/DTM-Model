// Indicators used on the world map (latest value per country).
export const GLOBAL_IND = {
  cbr: "SP.DYN.CBRT.IN", // births per 1,000 people
  cdr: "SP.DYN.CDRT.IN", // deaths per 1,000 people
  tfr: "SP.DYN.TFRT.IN", // babies per woman
  le: "SP.DYN.LE00.IN", // life expectancy at birth
  p65: "SP.POP.65UP.TO.ZS", // share aged 65+
  grow: "SP.POP.GROW", // population growth, % a year
  pop: "SP.POP.TOTL" // total population
};

// Indicators fetched as full time series for a country page.
export const SERIES_IND = {
  cbr: "SP.DYN.CBRT.IN",
  cdr: "SP.DYN.CDRT.IN",
  tfr: "SP.DYN.TFRT.IN",
  le: "SP.DYN.LE00.IN",
  lem: "SP.DYN.LE00.MA.IN",
  lef: "SP.DYN.LE00.FE.IN",
  pop: "SP.POP.TOTL",
  grow: "SP.POP.GROW",
  urban: "SP.URB.TOTL.IN.ZS",
  imr: "SP.DYN.IMRT.IN",
  dep: "SP.POP.DPND",
  mig: "SM.POP.NETM",
  gdp: "NY.GDP.PCAP.CD",
  p014: "SP.POP.0014.TO.ZS",
  p1564: "SP.POP.1564.TO.ZS",
  p65: "SP.POP.65UP.TO.ZS"
};

// Age bands. Pattern: SP.POP.{band}.{MA|FE}.5Y
export const BANDS = ["0004", "0509", "1014", "1519", "2024", "2529", "3034", "3539", "4044", "4549", "5054", "5559", "6064", "6569", "7074", "7579", "80UP"];
export const BAND_LABELS = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"];

export const FIRST_YEAR = 1960;
export const LAST_YEAR = 2025;
