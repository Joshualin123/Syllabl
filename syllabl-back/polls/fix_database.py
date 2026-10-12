from pathlib import Path
import re
import pyphen
from lemminflect import getInflection

INPUT_FILE = Path("all-words-sorted-by-frequency.txt")
OUTPUT_FILE = Path("polished-words.txt")

hyphenator = pyphen.Pyphen(lang="en_US")
PARTS_OF_SPEECH = ["VB", "VBD", "VBG", "VBZ"]


def get_word(entry):
    """Remove syllable separators to get the complete word."""
    return entry.replace(";", "").lower()


def split_syllables(word):
    """Suggest syllable boundaries using English hyphenation."""
    parts = hyphenator.inserted(word).split("-")
    return ";".join(parts)


def load_database():
    # Preserve the existing syllable splits whenever available.
    entries = {}
    original_order = []

    with INPUT_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            entry = line.strip().lower()

            # Ignore blank lines and malformed entries.
            if not re.fullmatch(r"[a-z]+(?:;[a-z]+)*", entry):
                continue

            word = get_word(entry)

            if word not in entries:
                original_order.append(word)
                entries[word] = entry

            # Prefer an existing syllable-separated entry.
            if ";" in entry:
                entries[word] = entry

    # Split words that currently have no separators.
    for word in list(entries):
        if ";" not in entries[word]:
            entries[word] = split_syllables(word)

    return entries, original_order


def add_word(entries, word):
    """Add a missing word with suggested syllable boundaries."""
    word = word.lower()

    if not re.fullmatch(r"[a-z]+", word):
        return

    if word not in entries:
        entries[word] = split_syllables(word)


def expand_word_forms(entries):
    """Add recognized noun, verb, adjective and adverb forms."""
    original_words = list(entries.keys())

    for word in original_words:
        for tag in PARTS_OF_SPEECH:
            try:
                forms = getInflection(word, tag=tag)
            except Exception:
                continue

            # lemminflect returns word forms grouped by grammatical tag.
            if not forms:
                continue

            for form in forms:
                add_word(entries, form)

    return len(entries) - len(original_words)

def main():
    entries, original_order = load_database()
    initial_count = len(entries)

    added = expand_word_forms(entries)

    # Keep the original frequency order, then append new entries
    # alphabetically for predictable output.
    new_words = sorted(set(entries) - set(original_order))
    output_order = list(dict.fromkeys(original_order + new_words))

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        for word in output_order:
            file.write(entries[word] + "\n")

    print(f"Original unique words: {initial_count}")
    print(f"New word forms added: {added}")
    print(f"Final unique words:   {len(entries)}")
    print(f"Saved database to:    {OUTPUT_FILE.resolve()}")

if __name__ == "__main__":
    main()