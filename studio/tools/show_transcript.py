"""Print a Whisper transcript with times:  python3 show_transcript.py work/talk/talk.json [--words]
Machine transcripts of this speaker are full of slips (his accent merges غ and ق: «قریزه» = غریزه, «قضا» = غذا). Use it to FIND passages and times, then write the real words yourself."""
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8')); words = '--words' in sys.argv
mm = lambda t: f'{int(t // 60)}:{t % 60:04.1f}'
for s in d['segments']:
    print(f"[{mm(s['start'])} - {mm(s['end'])}]  ({s['start']:.1f}-{s['end']:.1f})  {s['text'].strip()}")
    if words: print('      ' + '  '.join(f"{w['word'].strip()}@{w['start']:.2f}" for w in s.get('words', [])))
