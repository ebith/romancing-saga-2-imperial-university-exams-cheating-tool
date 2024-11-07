import Fuse from 'fuse.js';
import { createWorker } from 'tesseract.js';
import exams from './exams.json' with { type: 'json' };

(async () => {
  const worker = await createWorker('jpn')
  const fuse = new Fuse(exams, { keys: ['question'] })

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'enviroment' },
  })
  const video = document.querySelector('#video')
  video.srcObject = stream
  video.play() // for iOS
  const ctx1 = document.querySelector('#canvas1').getContext('2d')
  const canvas2 = document.querySelector('#canvas2')
  const ctx2 = canvas2.getContext('2d')

  const updateCanvas = () => {
    ctx1.drawImage(video, 0, 0)
    ctx1.strokeRect(10, 50, 300, 80)
    ctx2.drawImage(video, 10, 50, 300, 80, 0, 0, 300, 80)
    requestAnimationFrame(updateCanvas)
  }

  updateCanvas()

  document.querySelector('body').addEventListener('click', async () => {
    const image = canvas2.toDataURL()
    const {
      data: { text },
    } = await worker.recognize(image)

    const result = fuse.search(text.replace(/\s+/g, ''))
    const log = document.createElement('div')
    if (result.length > 0 ) {
      document.querySelector('#answer').textContent = result[0].item.answer
    } else {
      document.querySelector('#answer').textContent = '読み取り失敗'
    }
    document.querySelector('body').appendChild(log)
  })
})()
