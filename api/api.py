from transformers import AutoTokenizer, AutoModelWithLMHead

tokenizer = AutoTokenizer.from_pretrained("mrm8488/t5-base-finetuned-emotion")

model = AutoModelWithLMHead.from_pretrained("mrm8488/t5-base-finetuned-emotion")


def get_emotion(text):
    input_ids = tokenizer.encode(text + '</s>', return_tensors='pt')

    output = model.generate(input_ids=input_ids,
                            max_length=2)

    dec = [tokenizer.decode(ids) for ids in output]
    label = dec[0]
    return label


from flask import Flask, request
import json

app = Flask(__name__)


@app.route('/', methods = ['GET'])
def emot():
    text = request.args.get('text')
    try:
        emotion = get_emotion(text)[6:]
        return json.dumps(
            {
                'text': text,
                "emotion": emotion,
                "msg": 'success'
            }
        )
    except:
        return json.dumps({
            "msg": "error",
            "text": text,
            "error": "invalid request"
        })


app.run()
