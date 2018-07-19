extern crate png;
extern crate regex;
use regex::Regex;

extern crate csv;
use csv::Writer;

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

use std::fs::{self, File};

const LENGTH_PER_PART: usize = 3000;
const CSV_NAME: &'static str = "sprites.csv";
const CSV_FIELDS: [&'static str; 6] = ["sprite", "variant", "part", "width", "height", "data"];

lazy_static! {
    // two formats: sprites/<sprite_name>.png or sprites/<sprite_name>_<variant>.png
    static ref SPRITE_DATA: Regex = Regex::new(r"sprites/([a-zA-Z]+)(#([0-9]+))?\.png").unwrap();
}



fn main() {
    let mut csv_file = File::create(CSV_NAME).expect("Unable to create file");
    let mut csv_wtr = Writer::from_writer(csv_file);
    
    for entry in fs::read_dir("sprites").expect("No directory sprites") {
        let path = entry.unwrap().path();
        let sprite_filename = path.to_str().unwrap();
        println!("{}", sprite_filename);
        // get the stuff that needs to be serielized into the csv file
        let sprite_parts = SpritePart::parts(sprite_filename);
        
        for sprite_part in sprite_parts {
            csv_wtr.serialize(sprite_part).expect("Couldn't serialize");
        }
    }
}

#[derive(Debug, Serialize)]
struct SpritePart {
    sprite: String,
    variant: u32,
    part: u32,
    width: u32,
    height: u32,
    data: String,
}

impl SpritePart {
    fn parts(filename: &str) -> Vec<SpritePart> {
        // get the variant by looking at the filename
        let (sprite, variant) = parse_filename(filename);
        
        // figure out the data from the actual file
        let (rgba, width, height) = get_rgba(filename);
        let string_form = stringify(&rgba);
        
        // split up the imageData into multiple pices
        let pieces = chunks(&string_form, LENGTH_PER_PART);
        
        let mut sprites = Vec::new();
        for (piece, part) in pieces.iter().zip(0..) {
            sprites.push(SpritePart {
                sprite: sprite.clone(),
                variant,
                part,
                width,
                height,
                data: (*piece).to_owned(),
            });
        }
        
        sprites
    }
}


fn chunks(string: &str, size: usize) -> Vec<&str> {
    // splits string into several pieces who's size doesn't exceed size
    
    let mut cs = Vec::new();
    let mut string = string;
    
    while string.len() >= size {
        let (c1, c2) = string.split_at(size);
        cs.push(c1);
        string = c2;
    }
    
    if string.len() != 0 { cs.push(string) }
    cs
}

fn parse_filename(filename: &str) -> (String, u32) {
    let captures = SPRITE_DATA.captures(filename).expect("Bad sprite name");
    
    let sprite_name = captures[1].to_owned();
    let variant = match captures.get(3) {
        Some(m) => m.as_str().parse().unwrap(),
        None => 0,
    };
    
    (sprite_name, variant)
}


fn stringify(rgba: &[u8]) -> String {
    rgba.iter()
        .map(|&byte| byte_to_char(byte))
        .collect()
}

fn byte_to_char(byte: u8) -> char {
    // compress byte into a character between 0x5d to 0xff
    // this is lossy; we'll end up with ~22 bit colors
    (byte as f32 * (162.0/255.0) + 93.0).floor() as u8 as char
}

fn get_rgba(filename: &str) -> (Vec<u8>, u32, u32) {
    let decoder = png::Decoder::new(File::open(filename).unwrap());
    
    let (info, mut reader) = decoder.read_info().unwrap();
    let mut buf = vec![0; info.buffer_size()];
    reader.next_frame(&mut buf).unwrap();
    
    (buf, info.width, info.height)
}
