# FreshScan: is this fruit going off?

My final year project. Post harvest loss hits smallholder farmers hard, and a cheap, quick quality check could help. FreshScan takes a photo of a banana, apple or orange and tells you if it's fresh or rotten, on the phone, with no internet needed.

**Live app:** https://studio-9682297283-9f88c.web.app/ (best on a phone)

## How it works

Two stages:
1. Is this a fruit at all?
2. Which fruit, and is it fresh or rotten? (11 classes)

I trained two models on the same data:

| Model | Accuracy | Training |
|---|---|---|
| Custom CNN, designed from scratch | around 97 to 98% | slower |
| MobileNetV3 Large, transfer learning | around 99% | much faster |

Close to a tie on accuracy, but MobileNet trained much faster and is built to be small, which matters more on a cheap phone in a field. Both are exported to ONNX and the app runs inference in the browser.

## What's in here

| Path | What it is |
|---|---|
| `training/fruit_classifier_train.ipynb` | The full training pipeline (PyTorch, run on a Colab T4 GPU). [Open in Colab](https://colab.research.google.com/drive/1JWRHCgwSL284IfoxmMdVCy5sYw09AyHs) |
| `training/fruit_classifier_train.py` | The same notebook as a script |
| `models/` | Both trained models as ONNX (`scratch_model.onnx`, `transfer_model.onnx`) |
| `app/` | The Next.js app (built in Firebase Studio) that runs the model on device |

## Run the app locally

```
cd app
npm install
npm run dev
```

## Next

Training it across multiple GPUs on infrastructure I'm setting up myself.
