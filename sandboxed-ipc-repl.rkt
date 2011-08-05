#lang racket
(require racket/sandbox
         racket/pretty)
(require (planet "describe.rkt" ("williams" "describe.plt" 1 3)))

(define e (make-evaluator 'racket/base '(require racket/list)
                                       '(require racket/vector)
                                       '(require racket/function)
                                       '(require racket/mpair)
                                       '(require racket/port)
                                       '(require net/url)
                                       '(require (planet "describe.rkt" ("williams" "describe.plt" 1 3)))))

(e '(define (join lst str)
  (let jn ([l lst] [a ""])
    (cond [(null? (cdr l)) (string-append a (car l))]
          [else (jn (cdr l) (string-append a (car l) str))]))))

(e '(define (.. start end)
  (let ([diff (- end start)])
    (build-list diff (λ (n) (+ n start))))))

(pretty-write (e (read)))
