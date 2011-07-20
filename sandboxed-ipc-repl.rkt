#lang racket
(require racket/sandbox)
(require racket/pretty)

(define e (make-evaluator 'racket/base '(require racket/list)
                                       '(require racket/vector)
                                       '(require racket/function)))

(e '(define (join lst str)
  (let jn ([l lst] [a ""])
    (cond [(null? (cdr l)) (string-append a (car l))]
          [else (jn (cdr l) (string-append a (car l) str))]))))

(e '(define (.. start end)
  (let ([diff (- end start)])
    (build-list diff (λ (n) (+ n start))))))

(pretty-write (e (read)))
