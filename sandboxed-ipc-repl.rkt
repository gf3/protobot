#lang racket
(require racket/sandbox)
(require racket/pretty)

(define e (make-evaluator 'racket/base '(require racket/list)))

(e '(define (join lst str)
  (let jn ([l lst] [a ""])
    (cond [(null? (cdr l)) (string-append a (car l))]
          [else (jn (cdr l) (string-append a (car l) str))]))))

(pretty-display (e (read)))
