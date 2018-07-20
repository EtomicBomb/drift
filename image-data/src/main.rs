#![feature(universal_impl_trait)]
#![allow(non_camel_case_types)] // to get rid of the weird impl Iter warning
extern crate png;
extern crate regex;
use regex::Regex;

extern crate csv;
use csv::Writer;

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

use std::fs::{self, File};
use std::fmt::Debug;

const LENGTH_PER_PART: usize = 1000;
const CSV_NAME: &'static str = "sprites.csv";

lazy_static! {
    // two formats: sprites/<sprite_name>.png or sprites/<sprite_name>_<variant>.png
    static ref SPRITE_DATA: Regex = Regex::new(r"sprites/(\w+)(#(\d+))?\.png").unwrap();
}

fn main() {
    let csv_file = File::create(CSV_NAME).expect("Unable to create file");
    let mut csv_wtr = Writer::from_writer(csv_file);
    
    for sprite_filename in read_directory_sorted("sprites") {
        // get the stuff that needs to be serielized into the csv file
        println!("Reading {}", sprite_filename);
        let sprite_parts = SpritePart::parts(&sprite_filename);
        for sprite_part in sprite_parts {
            csv_wtr.serialize(sprite_part).expect("Couldn't serialize");
        }
    }
}

fn read_directory_sorted(dir_name: &str) -> Vec<String> {
    // returns a sorted list of all of the files in the dircetory
    let iter = fs::read_dir(dir_name).expect("Couldn't read directory");
    let mut vec = iter
        .map(|entry| {
            let path = entry.unwrap().path();
            path.to_str().unwrap().to_owned()
        }).collect::<Vec<String>>();
        
    vec.sort();
    vec
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
        
        // split up the imageData into multiple pices
        let pieces = chunks(&rgba, LENGTH_PER_PART);
        
        let mut sprites = Vec::new();
        for (piece, part) in pieces.into_iter().zip(0..) {
            sprites.push(SpritePart {
                sprite: sprite.clone(),
                variant,
                part,
                width,
                height,
                data: piece,
            });
        }
        
        sprites
    }
}

fn chunks(vec: &[u8], size: usize) -> Vec<String> {
    vec
        .chunks(size)
        .map(|chunk| stringify(chunk.iter().cloned()))
        .collect()
}

fn stringify<T: Debug>(iter: impl Iterator<Item=T>) -> String {
    let mut string = String::from("\"[");
    for item in iter {
        string += &format!("{:?},", item);
    }
    string.pop(); // remove the last comma
    string += "]\"";
    string
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


fn get_rgba(filename: &str) -> (Vec<u8>, u32, u32) {
    let decoder = png::Decoder::new(File::open(filename).unwrap());
    
    let (info, mut reader) = decoder.read_info().unwrap();
    let mut buf = vec![0; info.buffer_size()];
    reader.next_frame(&mut buf).unwrap();
    
    (buf, info.width, info.height)
}
